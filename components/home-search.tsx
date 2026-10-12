"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Bike } from "lucide-react";

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function HomeSearch() {
  const [today, setToday] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setToday(localDateString());
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (Boolean(start) !== Boolean(end)) {
      event.preventDefault();
      setError("Choose both a pick-up and return date, or leave both empty.");
      return;
    }
    if (start && end && end <= start) {
      event.preventDefault();
      setError("Return date must be after the pick-up date.");
      return;
    }
    setError("");
  }

  return (
    <div className="home-search-shell">
      <div className="home-search-heading">
        <span className="home-search-kicker">PLAN YOUR NEXT RIDE</span>
        <span className="home-search-note">A few details. Better options.</span>
      </div>
      <form className="home-search-form" action="/rent" method="get" onSubmit={handleSubmit}>
        <div className="home-search-field">
          <label htmlFor="home-city"><MapPin size={15} /> Where</label>
          <select id="home-city" name="city" defaultValue="All locations">
            <option value="All locations">All locations</option>
            <option value="Chennai">Chennai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Kochi">Kochi</option>
            <option value="Coimbatore">Coimbatore</option>
          </select>
        </div>
        <div className="home-search-field">
          <label htmlFor="home-wheels"><Bike size={15} /> Ride type</label>
          <select id="home-wheels" name="wheels" defaultValue="All vehicles">
            <option value="All vehicles">Anything</option>
            <option value="2-Wheeler">Bike or scooter</option>
            <option value="4-Wheeler">Car</option>
          </select>
        </div>
        <div className="home-search-field">
          <label htmlFor="home-start"><CalendarDays size={15} /> Pick-up</label>
          <input id="home-start" name="start" type="date" min={today || undefined} value={start} onChange={(event) => { setStart(event.target.value); if (end && event.target.value && end <= event.target.value) setEnd(""); setError(""); }} />
        </div>
        <div className="home-search-field">
          <label htmlFor="home-end"><CalendarDays size={15} /> Return</label>
          <input id="home-end" name="end" type="date" min={start || today || undefined} value={end} onChange={(event) => { setEnd(event.target.value); setError(""); }} />
        </div>
        <button className="home-search-submit" type="submit">
          Find a ride <ArrowUpRight size={18} />
        </button>
      </form>
      {error && <p className="home-search-error" role="alert">{error}</p>}
    </div>
  );
}
