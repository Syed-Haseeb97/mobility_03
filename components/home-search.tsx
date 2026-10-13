"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { getIndiaDateString, nextDateString } from "@/lib/date-utils";

export function HomeSearch() {
  const [today, setToday] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => setToday(getIndiaDateString()), []);

  const minimumReturnDate = start ? nextDateString(start) : today;

  return (
    <form className="landing-search-form" action="/rent" method="get">
      <label className="landing-search-field">
        <span><MapPin size={14} /> CITY / CAMPUS</span>
        <select name="city" defaultValue="All locations">
          <option>All locations</option>
          <option>Chennai</option>
          <option>Bengaluru</option>
          <option>Hyderabad</option>
          <option>Mumbai</option>
          <option>Kochi</option>
          <option>Coimbatore</option>
        </select>
      </label>
      <label className="landing-search-field">
        <span><ArrowUpRight size={14} /> VEHICLE TYPE</span>
        <select name="wheels" defaultValue="All vehicles">
          <option>All vehicles</option>
          <option value="2-Wheeler">Bikes & scooters</option>
          <option value="4-Wheeler">Cars & SUVs</option>
        </select>
      </label>
      <label className="landing-search-field">
        <span><CalendarDays size={14} /> PICK-UP</span>
        <input name="start" type="date" min={today || undefined} required={Boolean(start || end)} value={start} onChange={(event) => {
          const nextStart = event.target.value;
          setStart(nextStart);
          if (end && end <= nextStart) setEnd("");
        }} />
      </label>
      <label className="landing-search-field">
        <span><CalendarDays size={14} /> RETURN</span>
        <input name="end" type="date" min={minimumReturnDate} required={Boolean(start || end)} value={end} onChange={(event) => setEnd(event.target.value)} />
      </label>
      <button className="landing-search-submit" type="submit">Find a ride <ArrowUpRight size={18} /></button>
    </form>
  );
}
