import { FunctionalComponent } from "preact";
import { useState } from "preact/hooks";
import { ColumnConfig, StatsResponse, FormattedSkillData } from "./types";
import { baseUrl } from "./api";

const columns: ColumnConfig[] = [
  { key: "name", title: "Name" },
  { key: "level", title: "Level" },
  { key: "xp", title: "XP", formatter: (x: number) => x.toLocaleString() },
  { key: "rank", title: "Rank", formatter: (x: number) => x.toLocaleString() },
  {
    key: "percent",
    title: "Percent to 99",
    formatter: (x: number) => (Math.round(x * 10) / 10).toFixed(1),
  },
];

export const Results: FunctionalComponent<{ data: StatsResponse }> = ({
  data,
}) => {
  const [sortHeader, setSortHeader] = useState<string>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">();

  const onHeaderClick = (header: string) => {
    setSortHeader(header);
    if (!sortDirection) {
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortDirection(undefined);
      setSortHeader(undefined);
    }
  };

  const skills = data.skills.filter((x) => x.name !== "Overall");

  const maxXp = 13034431;

  const withPercent: FormattedSkillData[] = skills
    .map((x) => ({
      ...x,
      percent: (100 * Math.min(x.xp, maxXp)) / maxXp,
    }))
    .sort((a: Record<string, any>, b: Record<string, any>) => {
      if (!(sortDirection && sortHeader)) {
        return 0;
      }

      if (typeof a[sortHeader] === "string") {
        const v1: string = a[sortHeader];
        const v2: string = b[sortHeader];
        return sortDirection === "asc"
          ? v1.localeCompare(v2)
          : v2.localeCompare(v1);
      } else {
        const v1: number = a[sortHeader];
        const v2: number = b[sortHeader];
        return sortDirection === "asc" ? v1 - v2 : v2 - v1;
      }
    });

  const overall =
    withPercent.reduce((acc, next) => (acc += next.percent), 0) /
    withPercent.length;

  const overallRoundex = Math.round(overall * 10) / 10;

  return (
    <>
      <div>Overall percent to all 99s: {overallRoundex}% </div>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => onHeaderClick(c.key)}
                key={c.key}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "8px",
                  }}
                >
                  <div>{c.title}</div>
                  <div>
                    {sortDirection === "asc" && sortHeader === c.key && "↑"}
                    {sortDirection === "desc" && sortHeader === c.key && "↓"}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {withPercent.map((s) => (
            <tr key={s.id}>
              {columns.map((c, i) => (
                <td key={c.key}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "8px",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    {i === 0 && (
                      <img src={`${baseUrl}?skill=${s[c.key]}`}></img>
                    )}
                    {c.key === "rank" && s[c.key] === -1 ? (
                      <em style={{ opacity: "50%" }}>unranked</em>
                    ) : c.formatter ? (
                      c.formatter(s[c.key])
                    ) : (
                      s[c.key]
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
