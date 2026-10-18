import GridOps from "@/components/gridops";
import { defaults, Filters } from "@/lib/gridops";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const filters = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof Filters)[])
    if (typeof query[key] === "string") filters[key] = query[key] as string;
  return <GridOps initialFilters={filters} />;
}
