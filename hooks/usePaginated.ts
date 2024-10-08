"use client";

import React, { useEffect, useState } from "react";

export type FetchPaginatedData = (limit: number) => void;

export default function usePaginated<T>() {
  const [data, setData] = useState<T[]>([]);
  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {}, []);
}
