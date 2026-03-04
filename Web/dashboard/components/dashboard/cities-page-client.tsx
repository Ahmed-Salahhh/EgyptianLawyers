'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import {
  useCreateCityMutation,
  useDeleteCityMutation,
  useGetCitiesLookupQuery,
  useGetCitiesQuery,
  useUpdateCityMutation,
} from '@/lib/features/courts/api';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardModal } from '@/components/dashboard/dashboard-modal';
import { FilterSelect } from '@/components/dashboard/filter-select';
import { FilterFormRow } from '@/components/dashboard/filter-form-row';
import { Pagination } from '@/components/dashboard/pagination';

type CityFormValues = {
  name: string;
};

type CityFiltersFormValues = {
  cityId: string;
};

function EditIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M12 20h9' />
      <path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M3 6h18' />
      <path d='M8 6V4h8v2' />
      <path d='M19 6l-1 14H6L5 6' />
      <path d='M10 11v6' />
      <path d='M14 11v6' />
    </svg>
  );
}

export function CitiesPageClient() {
  const t = useTranslations('Pages');
  const citySchema = z.object({
    name: z.string().trim().min(1, t('cityNameRequired')),
  });
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [cityId, setCityId] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<{ id: string; name: string } | null>(null);
  const [cityToDelete, setCityToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data: citiesResponse, isLoading, isError } = useGetCitiesQuery({
    pageIndex,
    pageSize,
    ...(cityId ? { cityId } : {}),
  });
  const cities = citiesResponse?.data ?? [];
  const { data: citiesLookupResponse } = useGetCitiesLookupQuery();
  const citiesLookup = citiesLookupResponse ?? [];
  const [createCity, { isLoading: isCreating }] = useCreateCityMutation();
  const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();
  const isMutating = isCreating || isUpdating || isDeleting;

  useEffect(() => {
    setPageIndex(1);
  }, [pageSize]);

  const filtersForm = useForm<CityFiltersFormValues>({
    defaultValues: { cityId: '' },
  });

  const handleSearch = filtersForm.handleSubmit((values) => {
    setCityId(values.cityId);
    setPageIndex(1);
  });

  const createForm = useForm<CityFormValues>({
    defaultValues: { name: '' },
    resolver: zodResolver(citySchema),
  });
  const editForm = useForm<CityFormValues>({
    defaultValues: { name: '' },
    resolver: zodResolver(citySchema),
  });

  const openCreateModal = () => {
    createForm.reset({ name: '' });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    createForm.reset({ name: '' });
  };

  const handleCreateCity = createForm.handleSubmit(async (values) => {
    const name = values.name.trim();

    try {
      await createCity({ name }).unwrap();
      toast.success(t('cityCreatedSuccess'));
      closeCreateModal();
    } catch {
      toast.error(t('cityCreateFailed'));
    }
  });

  const startEditCity = (id: string, currentName: string) => {
    setEditingCity({ id, name: currentName });
    editForm.reset({ name: currentName });
  };

  const closeEditModal = () => {
    setEditingCity(null);
    editForm.reset({ name: '' });
  };

  const handleEditCity = editForm.handleSubmit(async (values) => {
    if (!editingCity) return;
    const name = values.name.trim();

    try {
      await updateCity({ id: editingCity.id, name }).unwrap();
      toast.success(t('cityUpdatedSuccess'));
      closeEditModal();
    } catch {
      toast.error(t('cityUpdateFailed'));
    }
  });

  const handleDeleteCity = async () => {
    if (!cityToDelete) return;
    try {
      await deleteCity({ id: cityToDelete.id }).unwrap();
      setCityToDelete(null);
      toast.success(t('cityDeletedSuccess'));
    } catch {
      toast.error(t('cityDeleteFailed'));
    }
  };

  return (
    <main>
      <div className='flex items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold text-[#1a2f52]'>{t('citiesTitle')}</h1>
        <button
          type='button'
          onClick={openCreateModal}
          className='rounded-lg bg-[#245ce2] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1f4fd0]'
        >
          {t('addCity')}
        </button>
      </div>

      <section className='mt-4'>
        <FilterFormRow onSubmit={handleSearch} submitLabel={t('search')}>
          <Controller
            control={filtersForm.control}
            name='cityId'
            render={({ field }) => (
              <FilterSelect
                value={field.value}
                onChange={field.onChange}
                placeholder={t('filterByCity')}
                clearLabel={t('clear')}
                options={citiesLookup.map((city) => ({ value: city.id, label: city.name }))}
              />
            )}
          />
        </FilterFormRow>

        {isLoading ? (
          <div className='rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]'>{t('loading')}</div>
        ) : isError ? (
          <div className='rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]'>{t('failedToLoad')}</div>
        ) : cities.length === 0 ? (
          <div className='rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]'>{t('noCities')}</div>
        ) : (
          <>
            <DataTable
              columns={[
                { key: 'name', header: t('city') },
                { key: 'courts', header: t('court') },
                { key: 'action', header: t('action') },
              ]}
              rows={cities.map((city) => ({
                key: city.id,
                cells: [
                  city.name,
                  city.courts.length > 0 ? (
                    <div key={`${city.id}-courts`} className='flex flex-wrap justify-center gap-1.5'>
                      {city.courts.map((court) => (
                        <span
                          key={court.id}
                          className='rounded-full border border-[#d8e2f3] bg-[#f7faff] px-2 py-0.5 text-xs text-[#30415d]'
                        >
                          {court.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  ),
                  <div key={`${city.id}-actions`} className='flex items-center justify-center gap-2'>
                    <button
                      type='button'
                      onClick={() => startEditCity(city.id, city.name)}
                      disabled={isMutating}
                      title={t('edit')}
                      aria-label={t('edit')}
                      className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d3def2] bg-[#f7faff] text-[#30415d] disabled:opacity-60'
                    >
                      <EditIcon />
                    </button>
                    <button
                      type='button'
                      onClick={() => setCityToDelete({ id: city.id, name: city.name })}
                      disabled={isMutating}
                      title={t('delete')}
                      aria-label={t('delete')}
                      className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#f1d4dd] bg-[#fff7fa] text-[#b53f58] disabled:opacity-60'
                    >
                      <DeleteIcon />
                    </button>
                  </div>,
                ],
              }))}
            />
            <Pagination
              pageIndex={citiesResponse?.pageIndex ?? pageIndex}
              totalPages={citiesResponse?.totalPages ?? 1}
              totalCount={citiesResponse?.totalCount ?? cities.length}
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
      </section>

      <DashboardModal
        open={isCreateModalOpen}
        title={t('addCity')}
        onClose={closeCreateModal}
        closeLabel={t('closeDialog')}
      >
        <form onSubmit={handleCreateCity} className='space-y-3'>
          <div>
            <input
              {...createForm.register('name')}
              className='w-full rounded-lg border border-[#d8e2f3] bg-white px-3 py-2 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2'
              placeholder={t('cityName')}
            />
            {createForm.formState.errors.name ? (
              <p className='mt-1 text-xs text-[#b53f58]'>{createForm.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={closeCreateModal}
              className='rounded-lg border border-[#d8e2f3] bg-white px-3 py-2 text-sm text-[#314866]'
            >
              {t('cancel')}
            </button>
            <button
              type='submit'
              disabled={isMutating}
              className='rounded-lg bg-[#245ce2] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60'
            >
              {t('addCity')}
            </button>
          </div>
        </form>
      </DashboardModal>

      <DashboardModal
        open={Boolean(editingCity)}
        title={editingCity ? `${t('edit')}: ${editingCity.name}` : t('edit')}
        onClose={closeEditModal}
        closeLabel={t('closeDialog')}
      >
        <form onSubmit={handleEditCity} className='space-y-3'>
          <div>
            <input
              {...editForm.register('name')}
              className='w-full rounded-lg border border-[#d8e2f3] bg-white px-3 py-2 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2'
              placeholder={t('cityName')}
            />
            {editForm.formState.errors.name ? (
              <p className='mt-1 text-xs text-[#b53f58]'>{editForm.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={closeEditModal}
              className='rounded-lg border border-[#d8e2f3] bg-white px-3 py-2 text-sm text-[#314866]'
            >
              {t('cancel')}
            </button>
            <button
              type='submit'
              disabled={isMutating}
              className='rounded-lg bg-[#245ce2] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60'
            >
              {t('edit')}
            </button>
          </div>
        </form>
      </DashboardModal>

      <DashboardModal
        open={Boolean(cityToDelete)}
        title={t('deleteCityTitle')}
        onClose={() => setCityToDelete(null)}
        closeLabel={t('closeDialog')}
      >
        <p className='text-sm text-[#4e648c]'>
          {t.rich('confirmDeleteCityWithName', {
            name: cityToDelete?.name ?? '',
            strong: (chunks) => <span className='font-semibold'>{chunks}</span>,
          })}
        </p>
        <div className='mt-4 flex justify-end gap-2'>
          <button
            type='button'
            onClick={() => setCityToDelete(null)}
            className='rounded-lg border border-[#d8e2f3] bg-white px-3 py-2 text-sm text-[#314866]'
          >
            {t('cancel')}
          </button>
          <button
            type='button'
            onClick={handleDeleteCity}
            disabled={isMutating}
            className='rounded-lg bg-[#d94b64] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60'
          >
            {t('delete')}
          </button>
        </div>
      </DashboardModal>
    </main>
  );
}
