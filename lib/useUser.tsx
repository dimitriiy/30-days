import { computed, withAsyncData } from "@reatom/core";
import { reatomComponent } from "@reatom/react";
import { httpGet } from "./api";


const userQuery = computed(async () => {
    return httpGet(`/api/auth/me`);
  }).extend(withAsyncData({
    cacheParams:true
  }));



  export function useUser() {
    const user = userQuery();

    
    return user;
  }