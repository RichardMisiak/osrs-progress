import { useEffect, useState } from "preact/hooks";
import "./app.css";
import { FunctionalComponent } from "preact";

const baseUrl =
  import.meta.env.VITE_API_URL ??
  "https://osrs-stats.richard-h-misiak.workers.dev";

type SkillData = {
  id: number;
  name: string;
  rank: number;
  level: number;
  xp: number;
} & Record<string, any>;

type SkillDataWithPercent = SkillData & { percent: number; percentRaw: number };

type StatsResponse = {
  skills: SkillData[];
};

export function App() {
  const [fetching, setFetching] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getData = async (user: string) => {
    setFetching(true);
    setData(null);
    setError(null);

    // pushState does this without a page reload
    const url = new URL(window.location.href);
    url.searchParams.set("user", user.trim());
    window.history.pushState(null, "", url.toString());

    const response = await fetch(`${baseUrl}?user=${user.trim()}`);
    if (response.status === 200) {
      const json: StatsResponse = await response.json();
      setData(json);
    } else {
      setError(`Failed to load details, API returned: ${response.status}`);
    }
    setFetching(false);
  };

  useEffect(() => {
    // read the user from the query string on first load
    const params = new URLSearchParams(location.search);
    const user = params.get("user");
    if (user) {
      setUsername(user);
      getData(user);
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      <h2>OSRS progress to max level</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "16px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          style={{ marginBottom: 0 }}
          type="text"
          disabled={fetching}
          value={username}
          onInput={(e) => setUsername((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getData(username);
            }
          }}
          placeholder="Enter a username"
        ></input>
        <button disabled={fetching} onClick={() => getData(username)}>
          Search
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {fetching && <div>Loading</div>}
        {error && <div>{error}</div>}
        {data && <Results data={data}></Results>}
      </div>
    </div>
  );
}

const Results: FunctionalComponent<{ data: StatsResponse }> = ({ data }) => {
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

  const headers = [
    ...Object.keys(skills[0]).filter((x) => x !== "id"),
    "percent",
  ];

  const maxXp = 13034431;

  const withPercent: SkillDataWithPercent[] = skills
    .map((x) => ({
      ...x,
      percentRaw: (100 * Math.min(x.xp, maxXp)) / maxXp,
      percent: Math.round((10 * (100 * Math.min(x.xp, maxXp))) / maxXp) / 10,
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

  const overallRaw =
    withPercent.reduce((acc, next) => (acc += next.percentRaw), 0) /
    withPercent.length;

  const overall = Math.round(overallRaw * 10) / 10;

  return (
    <>
      <div>Overall percent to max: {overall}% </div>
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                style={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => onHeaderClick(h)}
                key={h}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "8px",
                  }}
                >
                  <div>{h}</div>
                  <div>
                    {sortDirection === "asc" && sortHeader === h && "↑"}
                    {sortDirection === "desc" && sortHeader === h && "↓"}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {withPercent.map((s) => (
            <tr key={s.id}>
              {headers.map((h, i) => (
                <td key={h}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "8px",
                      alignItems: "center",
                      justifyContent: "flex-start",
                    }}
                  >
                    {i === 0 && <img src={`${baseUrl}?skill=${s[h]}`}></img>}
                    {h === "rank" && s[h] === -1 ? (
                      <em style={{ opacity: "50%" }}>unranked</em>
                    ) : (
                      s[h]
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
