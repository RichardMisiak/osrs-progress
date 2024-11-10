import { useEffect, useState } from "preact/hooks";
import "./app.css";
import { FunctionalComponent } from "preact";
import { StatsResponse } from "./types";
import { Results } from "./Results";
import { api } from "./api";

export const App: FunctionalComponent = () => {
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

    const response = await api.getStats(user);
    if ("data" in response) {
      setData(response.data);
    } else {
      setError(
        `Failed to load details, API returned: ${response.errorResponse.status}`
      );
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
};
