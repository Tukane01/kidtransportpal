
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { RideProvider } from "@/context/RideContext";
import Layout from "@/components/Layout";

const Index = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <RideProvider>
          <Layout />
        </RideProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export default Index;
