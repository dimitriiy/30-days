"use client";

import { computed, withAsyncData } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { httpGet, HttpError } from "./api";


const userQuery = computed(async () => {
    try {
      return await httpGet(`/api/auth/me`);
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return;
      }
      throw err;
    }
  }).extend(withAsyncData({
    cacheParams:true
  }));



  export function useUser() {
    const user = userQuery();

    
    return user;
  }