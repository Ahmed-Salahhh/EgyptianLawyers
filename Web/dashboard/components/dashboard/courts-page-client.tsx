"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useAddCityToCourtMutation,
  useCreateCourtMutation,
  useDeleteCityMutation,
  useDeleteCourtMutation,
  useGetCourtsQuery,
  useUpdateCityMutation,
  useUpdateCourtMutation,
} from "@/lib/features/courts/api";

export function CourtsPageClient() {
  const t = useTranslations("Pages");
  const [search, setSearch] = useState("");
  const { data: courts = [], isLoading, isError } = useGetCourtsQuery({
    query: search || undefined,
  });

  const [createCourt, { isLoading: isCreatingCourt }] = useCreateCourtMutation();
  const [updateCourt, { isLoading: isUpdatingCourt }] = useUpdateCourtMutation();
  const [deleteCourt, { isLoading: isDeletingCourt }] = useDeleteCourtMutation();
  const [addCityToCourt, { isLoading: isAddingCity }] = useAddCityToCourtMutation();
  const [updateCity, { isLoading: isUpdatingCity }] = useUpdateCityMutation();
  const [deleteCity, { isLoading: isDeletingCity }] = useDeleteCityMutation();

  const isMutating =
    isCreatingCourt ||
    isUpdatingCourt ||
    isDeletingCourt ||
    isAddingCity ||
    isUpdatingCity ||
    isDeletingCity;

  const handleCreateCourt = async () => {
    const name = window.prompt(t("newCourtPrompt"));
    if (!name || !name.trim()) return;
    await createCourt({ name: name.trim() });
  };

  const handleUpdateCourt = async (courtId: string, currentName: string) => {
    const name = window.prompt(t("editCourtPrompt"), currentName);
    if (!name || !name.trim()) return;
    await updateCourt({ id: courtId, name: name.trim() });
  };

  const handleDeleteCourt = async (courtId: string) => {
    const ok = window.confirm(t("confirmDeleteCourt"));
    if (!ok) return;
    await deleteCourt({ id: courtId });
  };

  const handleAddCity = async (courtId: string) => {
    const name = window.prompt(t("newCityPrompt"));
    if (!name || !name.trim()) return;
    await addCityToCourt({ courtId, name: name.trim() });
  };

  const handleUpdateCity = async (cityId: string, currentName: string) => {
    const name = window.prompt(t("editCityPrompt"), currentName);
    if (!name || !name.trim()) return;
    await updateCity({ id: cityId, name: name.trim() });
  };

  const handleDeleteCity = async (cityId: string) => {
    const ok = window.confirm(t("confirmDeleteCity"));
    if (!ok) return;
    await deleteCity({ id: cityId });
  };

  return (
    <main>
      <h1 className="text-2xl font-bold text-[#1a2f52]">{t("courtsTitle")}</h1>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 text-sm text-[#314866] outline-none ring-[#245ce2] focus:ring-2"
          placeholder={t("searchCourtOrCity")}
        />
        <button
          type="button"
          onClick={handleCreateCourt}
          disabled={isMutating}
          className="rounded-xl bg-[#245ce2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4fd0] disabled:opacity-60"
        >
          {t("addCourt")}
        </button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
            {t("loading")}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-[#f2ccd5] bg-[#fff5f8] p-4 text-sm text-[#a13c52]">
            {t("failedToLoad")}
          </div>
        ) : courts.length === 0 ? (
          <div className="rounded-xl border border-[#d8e2f3] bg-white p-4 text-sm text-[#5d6f8f]">
            {t("noCourtsFound")}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => (
              <article
                key={court.id}
                className="rounded-2xl border border-[#d8e2f3] bg-white p-4 shadow-[0_10px_24px_rgba(30,74,148,0.08)]"
              >
                <p className="font-semibold text-[#1a2f52]">{court.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {court.cities.length > 0 ? (
                    court.cities.map((city) => (
                      <span
                        key={city.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#d3def2] bg-[#f7faff] px-2.5 py-1 text-xs text-[#30415d]"
                      >
                        {city.name}
                        <button
                          type="button"
                          onClick={() => handleUpdateCity(city.id, city.name)}
                          disabled={isMutating}
                          className="rounded bg-white px-1 text-[10px] text-[#30415d] disabled:opacity-60"
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCity(city.id)}
                          disabled={isMutating}
                          className="rounded bg-white px-1 text-[10px] text-[#b53f58] disabled:opacity-60"
                        >
                          {t("delete")}
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#8b99b2]">{t("noCities")}</span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddCity(court.id)}
                    disabled={isMutating}
                    className="rounded-lg border border-[#d3def2] bg-[#f7faff] px-2.5 py-1.5 text-xs text-[#30415d] disabled:opacity-60"
                  >
                    {t("addCity")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateCourt(court.id, court.name)}
                    disabled={isMutating}
                    className="rounded-lg border border-[#d3def2] bg-[#f7faff] px-2.5 py-1.5 text-xs text-[#30415d] disabled:opacity-60"
                  >
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourt(court.id)}
                    disabled={isMutating}
                    className="rounded-lg border border-[#f1d4dd] bg-[#fff7fa] px-2.5 py-1.5 text-xs text-[#b53f58] disabled:opacity-60"
                  >
                    {t("delete")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

