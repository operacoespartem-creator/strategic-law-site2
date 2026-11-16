import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogStore } from "@/lib/blog/store";
import type { PostInput } from "@/lib/blog/types";

const keys = {
  published: ["blog", "published"] as const,
  slug: (slug: string) => ["blog", "slug", slug] as const,
  all: ["blog", "all"] as const,
  post: (id: string) => ["blog", "post", id] as const,
  members: ["blog", "members"] as const,
  session: ["blog", "session"] as const,
};

export const usePublishedPosts = () =>
  useQuery({ queryKey: keys.published, queryFn: () => blogStore.listPublished() });

export const usePublishedPost = (slug: string | undefined) =>
  useQuery({
    queryKey: keys.slug(slug ?? ""),
    queryFn: () => blogStore.getPublishedBySlug(slug ?? ""),
    enabled: Boolean(slug),
  });

export const useAllPosts = (enabled = true) =>
  useQuery({ queryKey: keys.all, queryFn: () => blogStore.listAll(), enabled });

export const usePost = (id: string | undefined) =>
  useQuery({
    queryKey: keys.post(id ?? ""),
    queryFn: () => blogStore.getById(id ?? ""),
    enabled: Boolean(id),
  });

export const useMembers = (enabled = true) =>
  useQuery({ queryKey: keys.members, queryFn: () => blogStore.listMembers(), enabled });

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => blogStore.save(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog"] }),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogStore.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog"] }),
  });
};

export const useSession = () => {
  const queryClient = useQueryClient();
  useEffect(
    () => blogStore.onAuthChange(() => queryClient.invalidateQueries({ queryKey: keys.session })),
    [queryClient],
  );
  return useQuery({ queryKey: keys.session, queryFn: () => blogStore.getSession() });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => blogStore.signIn(email, password),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.session }),
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => blogStore.signOut(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.session }),
  });
};

export const useResetDemo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await blogStore.reset?.();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blog"] }),
  });
};
