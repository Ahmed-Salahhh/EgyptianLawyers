import type { LookupCityDto } from "@/lib/features/courts/types";

type Props = {
  cities: LookupCityDto[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
};

export function CitySelect({
  cities,
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: Props) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {cities.map((city) => (
        <option key={city.id} value={city.id}>
          {city.name}
        </option>
      ))}
    </select>
  );
}

