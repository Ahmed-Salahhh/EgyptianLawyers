'use client';

import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { FilterSelect } from '@/components/dashboard/filter-select';
import { FilterFormRow } from '@/components/dashboard/filter-form-row';
import { LtrText } from '@/components/dashboard/ltr-text';
import { Pagination } from '@/components/dashboard/pagination';
import { useGetFlaggedItemsQuery } from '@/lib/features/posts/api';
import { useGetCitiesLookupQuery } from '@/lib/features/courts/api';

type Props = {
  locale: string;
};

type PostFiltersFormValues = {
  cityId: string;
  courtId: string;
};

function ViewIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z' />
      <circle cx='12' cy='12' r='3' />
    </svg>
  );
}

export function PostsPageClient({ locale }: Props) {
  const t = useTranslations('Pages');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [cityId, setCityId] = useState('');
  const [courtId, setCourtId] = useState('');
  const filtersForm = useForm<PostFiltersFormValues>({
    defaultValues: {
      cityId: '',
      courtId: '',
    },
  });
  const selectedCityId = filtersForm.watch('cityId');
  const { data: citiesResponse } = useGetCitiesLookupQuery();
  const cities = citiesResponse ?? [];
  const courtOptions = useMemo(() => {
    const selectedCity = cities.find((city) => city.id === selectedCityId);
    const source = selectedCity ? [selectedCity] : cities;
    const map = new Map<string, string>();
    for (const city of source) {
      for (const court of city.courts ?? []) {
        map.set(court.id, court.name);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [cities, selectedCityId]);

  useEffect(() => {
    setPageIndex(1);
  }, [pageSize]);
  const { data, isLoading, isError } = useGetFlaggedItemsQuery({
    pageIndex,
    pageSize,
    ...(cityId ? { cityId } : {}),
    ...(courtId ? { courtId } : {}),
  });
  const items = data?.data ?? [];

  const handleSearch = filtersForm.handleSubmit((values) => {
    setCityId(values.cityId);
    setCourtId(values.courtId);
    setPageIndex(1);
  });

  return (
    <main>
      <h1 className='text-2xl font-bold text-[#1a2f52]'>{t('postsTitle')}</h1>

      <div className='mt-5'>
        <FilterFormRow
          onSubmit={handleSearch}
          submitLabel={t('search')}
          className='md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'
        >
          <Controller
            control={filtersForm.control}
            name='cityId'
            render={({ field }) => (
              <FilterSelect
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  filtersForm.setValue('courtId', '');
                }}
                placeholder={t('filterByCity')}
                clearLabel={t('clear')}
                options={cities.map((city) => ({ value: city.id, label: city.name }))}
              />
            )}
          />
          <Controller
            control={filtersForm.control}
            name='courtId'
            render={({ field }) => (
              <FilterSelect
                value={field.value}
                onChange={field.onChange}
                placeholder={t('court')}
                clearLabel={t('clear')}
                options={courtOptions.map((court) => ({ value: court.id, label: court.name }))}
              />
            )}
          />
        </FilterFormRow>

        {isLoading ? (
          <div className='rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]'>
            {t('loading')}
          </div>
        ) : isError ? (
          <div className='rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]'>
            {t('failedToLoad')}
          </div>
        ) : items.length === 0 ? (
          <div className='rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]'>
            {t('noFlaggedItems')}
          </div>
        ) : (
          <>
            <DataTable
              columns={[
                { key: 'postId', header: t('postId'), className: 'whitespace-nowrap' },
                { key: 'court', header: t('court') },
                { key: 'city', header: t('city') },
                { key: 'lawyer', header: t('lawyer') },
                { key: 'createdAt', header: t('createdAt'), className: 'whitespace-nowrap' },
                { key: 'action', header: t('action'), className: 'whitespace-nowrap' },
              ]}
              rows={items.map((item) => ({
                key: item.id,
                cells: [
                  <Link
                    key={`${item.id}-id`}
                    href={`/posts/${item.id}`}
                    locale={locale}
                    className='font-medium text-[#245ce2] hover:underline'
                  >
                    <LtrText>{item.id}</LtrText>
                  </Link>,
                  item.courtName,
                  item.cityName,
                  item.lawyerFullName,
                  <LtrText key={`${item.id}-createdAt`}>{item.createdAt}</LtrText>,
                  <div key={`${item.id}-action`} className='flex items-center justify-center'>
                    <Link
                      href={`/posts/${item.id}`}
                      locale={locale}
                      title={t('openDetails')}
                      aria-label={t('openDetails')}
                      className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d3def2] bg-[#f7faff] text-[#30415d]'
                    >
                      <ViewIcon />
                    </Link>
                  </div>,
                ],
              }))}
            />
            <Pagination
              pageIndex={data?.pageIndex ?? pageIndex}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.totalCount ?? items.length}
              onPageChange={setPageIndex}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              resultsLabel={t('results')}
              ofLabel={t('of')}
              prevLabel={t('prev')}
              nextLabel={t('next')}
              previousPageAriaLabel={t('previousPage')}
              nextPageAriaLabel={t('nextPage')}
              pageSuffixLabel={t('page')}
            />
          </>
        )}
      </div>
    </main>
  );
}
