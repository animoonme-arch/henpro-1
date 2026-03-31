"use client";
import React from "react";
import Loading from "./loadingInner";
import { SessionProvider } from "next-auth/react";

const loading = () => {
  return (
    <div>
      <SessionProvider>
        <Loading />
      </SessionProvider>
    </div>
  );
};

export default loading;
