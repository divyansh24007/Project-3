"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  Investigation,
  ScanResult,
  SystemAnalytics,
  UserSettings,
  DemoScenario,
} from "@/lib/api";

// --- Investigations Hooks ---

export function useInvestigations(params?: {
  status?: string;
  severity?: string;
  limit?: number;
}) {
  return useQuery<Investigation[], Error>({
    queryKey: ["investigations", params],
    queryFn: () => api.getInvestigations(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Poll updates every minute
  });
}

export function useInvestigation(id: string) {
  return useQuery<Investigation, Error>({
    queryKey: ["investigation", id],
    queryFn: () => api.getInvestigation(id),
    enabled: Boolean(id),
  });
}

// --- Analytics Hooks ---

export function useAnalytics(timeframe: string = "7d") {
  return useQuery<SystemAnalytics, Error>({
    queryKey: ["analytics", timeframe],
    queryFn: () => api.getAnalytics(timeframe),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 45, // Poll every 45 seconds for live dashboard updates
  });
}

// --- Scanning Mutation Hooks ---

export function useScanUrl() {
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, string>({
    mutationFn: (url: string) => api.scanUrl(url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investigations"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useScanMessage() {
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, string>({
    mutationFn: (message: string) => api.scanMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investigations"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useScanImage() {
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, File | FormData>({
    mutationFn: (file: File | FormData) => api.scanImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investigations"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useScanQR() {
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, File | FormData>({
    mutationFn: (file: File | FormData) => api.scanQR(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investigations"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

// --- Settings Hooks ---

export function useSettings() {
  return useQuery<UserSettings, Error>({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<UserSettings, Error, Partial<UserSettings>>({
    mutationFn: (settings: Partial<UserSettings>) => api.updateSettings(settings),
    onSuccess: (updated) => {
      queryClient.setQueryData(["settings"], updated);
    },
  });
}

// --- Demo Hooks ---

export function useDemoScenarios() {
  return useQuery<DemoScenario[], Error>({
    queryKey: ["demoScenarios"],
    queryFn: () => api.getDemoScenarios(),
  });
}

export function useRunDemo() {
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, string>({
    mutationFn: (scenarioId: string) => api.runDemo(scenarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investigations"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
