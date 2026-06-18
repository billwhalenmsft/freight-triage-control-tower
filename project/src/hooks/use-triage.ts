import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { data } from "@/data";

const KEYS = {
  items: ["items"] as const,
  item: (id: string) => ["item", id] as const,
  emails: ["emails"] as const,
  thread: (threadId: string) => ["thread", threadId] as const,
  owners: ["owners"] as const,
};

export function useItems() {
  return useQuery({ queryKey: KEYS.items, queryFn: () => data.listItems() });
}

export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.item(id ?? ""),
    queryFn: () => data.getItem(id!),
    enabled: !!id,
  });
}

export function useEmails() {
  return useQuery({ queryKey: KEYS.emails, queryFn: () => data.listEmails() });
}

export function useThreadEmails(threadId: string | undefined) {
  return useQuery({
    queryKey: KEYS.thread(threadId ?? ""),
    queryFn: () => data.emailsForThread(threadId!),
    enabled: !!threadId,
  });
}

export function useOwners() {
  return useQuery({ queryKey: KEYS.owners, queryFn: () => data.owners() });
}

function useItemMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.items });
      qc.invalidateQueries({ queryKey: ["item"] });
    },
  });
}

export function useAssign() {
  return useItemMutation(({ id, owner }: { id: string; owner: string }) => data.assign(id, owner));
}

export function useResolve() {
  return useItemMutation(({ id }: { id: string }) => data.resolve(id));
}

export function useReopen() {
  return useItemMutation(({ id }: { id: string }) => data.reopen(id));
}
