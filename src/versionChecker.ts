import {VERSION} from "./constants";


export async function isNewVersionAvailable() {
    const cached = sessionStorage.getItem("newVersionAvailable");

    if (cached !== null && Number.parseInt(cached, 10) === 0) {
        return false;
    }

    const res = await fetch(
        `https://raw.githubusercontent.com/htl-stp/moodle-blog-patch/refs/heads/main/package.json?t=${Date.now()}`,
        {
            cache: "no-store"
        }
    )

    if (!res.ok) {
        return false;
    }

    const json = await res.json();

    const newVersionAvailable = VERSION !== json.version;

    sessionStorage.setItem("newVersionAvailable", newVersionAvailable ? "1" : "0");

    return newVersionAvailable;
}