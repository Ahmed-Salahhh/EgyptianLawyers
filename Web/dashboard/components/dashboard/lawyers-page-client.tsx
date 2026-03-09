'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { DataTable } from '@/components/dashboard/data-table';
import { FilterSelect } from '@/components/dashboard/filter-select';
import { FilterFormRow } from '@/components/dashboard/filter-form-row';
import { LtrText } from '@/components/dashboard/ltr-text';
import { Pagination } from '@/components/dashboard/pagination';
import { useGetCitiesLookupQuery } from '@/lib/features/courts/api';
import {
  useApproveLawyerMutation,
  useGetLawyersQuery,
  useRejectLawyerMutation,
  useUnsuspendLawyerMutation,
} from '@/lib/features/lawyers/api';
import type { GetLawyersRequest, LawyerStatus } from '@/lib/features/lawyers/types';

type Props = {
  locale: string;
  activeStatus: LawyerStatus | 'all';
};

type LawyerFiltersFormValues = {
  cityId: string;
  syndicateCardNumber: string;
  whatsAppNumber: string;
};

export function LawyersPageClient({ locale, activeStatus }: Props) {
  const t = useTranslations('Pages');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [cityId, setCityId] = useState('');
  const [syndicateCardNumber, setSyndicateCardNumber] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const filtersForm = useForm<LawyerFiltersFormValues>({
    defaultValues: {
      cityId: '',
      syndicateCardNumber: '',
      whatsAppNumber: '',
    },
  });
  const { data: citiesResponse } = useGetCitiesLookupQuery();
  const cities = citiesResponse ?? [];

  const listParams: GetLawyersRequest = {
    pageIndex,
    pageSize,
    ...(cityId ? { cityId } : {}),
    ...(syndicateCardNumber ? { syndicateCardNumber } : {}),
    ...(whatsAppNumber ? { whatsAppNumber } : {}),
    ...(activeStatus === 'verified' ? { isVerified: true } : {}),
    ...(activeStatus === 'suspended' ? { isSuspended: true } : {}),
    ...(activeStatus === 'pending'
      ? { isVerified: false, isSuspended: false }
      : {}),
  };

  const { data, isLoading, isError } = useGetLawyersQuery({
    ...listParams,
  });
  const lawyers = data?.data ?? [];
  const [approveLawyer, { isLoading: isApproving }] =
    useApproveLawyerMutation();
  const [rejectLawyer, { isLoading: isRejecting }] = useRejectLawyerMutation();
  const [unsuspendLawyer, { isLoading: isUnsuspending }] =
    useUnsuspendLawyerMutation();
  const isUpdatingStatus = isApproving || isRejecting || isUnsuspending;

  const filterTabs: Array<{ key: 'all' | LawyerStatus; label: string }> = [
    { key: 'all', label: t('allStatuses') },
    { key: 'pending', label: t('pending') },
    { key: 'verified', label: t('verified') },
    { key: 'suspended', label: t('suspended') },
  ];

  const columns = [
    { key: 'name', header: t('name') },
    { key: 'city', header: t('city') },
    { key: 'status', header: t('status') },
    { key: 'card', header: t('cardNumber') },
    { key: 'whatsapp', header: t('whatsApp') },
    { key: 'createdAt', header: t('createdAt') },
    { key: 'action', header: t('action') },
  ];

  const statusLabel = (status: LawyerStatus) => {
    if (status === 'pending') return t('pending');
    if (status === 'verified') return t('verified');
    return t('suspended');
  };

  const mapStatus = (isVerified: boolean, isSuspended: boolean): LawyerStatus => {
    if (isSuspended) return 'suspended';
    if (isVerified) return 'verified';
    return 'pending';
  };

  const rows = lawyers.map((lawyer) => ({
    key: lawyer.id,
    cells: [
      <Link
        key={`${lawyer.id}-name`}
        href={`/lawyers/${lawyer.id}`}
        locale={locale}
        className='font-medium text-[#245ce2] hover:underline'
      >
        {lawyer.fullName}
      </Link>,
      lawyer.cities.length > 0
        ? (
          <div key={`${lawyer.id}-cities`} className='flex flex-wrap justify-center gap-1.5'>
            {lawyer.cities.map((city) => (
              <span
                key={city.id}
                className='rounded-full border border-[#d8e2f3] bg-[#f7faff] px-2 py-0.5 text-xs text-[#30415d]'
              >
                {city.name}
              </span>
            ))}
          </div>
        )
        : '-',
      statusLabel(mapStatus(lawyer.isVerified, lawyer.isSuspended)),
      <LtrText key={`${lawyer.id}-card`}>{lawyer.syndicateCardNumber}</LtrText>,
      <LtrText key={`${lawyer.id}-wa`}>{lawyer.whatsAppNumber}</LtrText>,
      <LtrText key={`${lawyer.id}-created`}>{lawyer.createdAt}</LtrText>,
      mapStatus(lawyer.isVerified, lawyer.isSuspended) === 'pending' ? (
        <div
          key={`${lawyer.id}-action`}
          className='flex justify-center items-center gap-2'
        >
          <button
            type='button'
            disabled={isUpdatingStatus}
            onClick={() => {
              if (mapStatus(lawyer.isVerified, lawyer.isSuspended) !== 'pending')
                return;
              approveLawyer({ lawyerId: lawyer.id });
            }}
            className='rounded-lg bg-[#245ce2] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60'
          >
            {t('approve')}
          </button>
        </div>
      ) : mapStatus(lawyer.isVerified, lawyer.isSuspended) === 'verified' ? (
        <div
          key={`${lawyer.id}-action`}
          className='flex justify-center items-center gap-2'
        >
          <button
            type='button'
            disabled={isUpdatingStatus}
            onClick={() => rejectLawyer({ lawyerId: lawyer.id })}
            className='rounded-lg bg-[#d94b64] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60'
          >
            {t('suspend')}
          </button>
        </div>
      ) : mapStatus(lawyer.isVerified, lawyer.isSuspended) === 'suspended' ? (
        <div
          key={`${lawyer.id}-action`}
          className='flex justify-center items-center gap-2'
        >
          <button
            type='button'
            disabled={isUpdatingStatus}
            onClick={() => unsuspendLawyer({ lawyerId: lawyer.id })}
            className='rounded-lg bg-[#245ce2] px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60'
          >
            {t('unsuspend')}
          </button>
        </div>
      ) : (
        <span key={`${lawyer.id}-action`} className='text-[#9aa9c3]'>
          -
        </span>
      ),
    ],
  }));

  const handleSearch = filtersForm.handleSubmit((values) => {
    setCityId(values.cityId);
    setSyndicateCardNumber(values.syndicateCardNumber.trim());
    setWhatsAppNumber(values.whatsAppNumber.trim());
    setPageIndex(1);
  });

  return (
    <main>
      <h1 className='text-2xl font-bold text-[#1a2f52]'>
        {t('lawyersDirectoryTitle')}
      </h1>

      <div className='mt-4 flex flex-wrap gap-2'>
        {filterTabs.map((tab) => {
          const isActive = activeStatus === tab.key;
          const href =
            tab.key === 'all' ? '/lawyers' : `/lawyers?status=${tab.key}`;

          return (
            <Link
              key={tab.key}
              href={href}
              locale={locale}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'border-[#245ce2] bg-[#245ce2] text-white'
                  : 'border-[#d2ddf2] bg-white text-[#4e648c] hover:bg-[#f2f6ff]'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <FilterFormRow
        onSubmit={handleSearch}
        submitLabel={t('search')}
        className='mt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]'
      >
        <Controller
          control={filtersForm.control}
          name='cityId'
          render={({ field }) => (
            <FilterSelect
              value={field.value}
              onChange={field.onChange}
              placeholder={t('filterByCity')}
              clearLabel={t('clear')}
              options={cities.map((city) => ({ value: city.id, label: city.name }))}
            />
          )}
        />
        <input
          {...filtersForm.register('syndicateCardNumber')}
          className='rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2'
          placeholder={t('syndicateCardNumber')}
        />
        <input
          {...filtersForm.register('whatsAppNumber')}
          className='rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2'
          placeholder={t('whatsApp')}
        />
      </FilterFormRow>

      <div className='mt-4'>
        {isLoading ? (
          <div className='rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]'>
            {t('loading')}
          </div>
        ) : isError ? (
          <div className='rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]'>
            {t('failedToLoad')}
          </div>
        ) : (
          <>
            <DataTable columns={columns} rows={rows} emptyText={t('noData')} />
            <Pagination
              pageIndex={data?.pageIndex ?? pageIndex}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.totalCount ?? lawyers.length}
              onPageChange={setPageIndex}
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageIndex(1);
              }}
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
