import instance from "../../../api";

export const JournalEntryService = {
  async getJournalEntries(filters: Object) {
    return instance
      .get("accounting/journal-entries/", { params: filters })
      .then((response) => response.data);
  },
  async getJournalEntryDetails(id: string) {
    return instance.get(`accounting/journal-entries/${id}/`).then((response) => response.data);
  },
  async createJournalEntry(payload: Object) {
    return instance.post("accounting/journal-entries/", payload).then((response) => response.data);
  },
  async updateJournalEntry(payload: Object, id: string) {
    return instance.patch(`accounting/journal-entries/${id}/`, payload).then((response) => response.data);
  },
  async deleteJournalEntry(id: string) {
    return instance.delete(`accounting/journal-entries/${id}/`).then((response) => response.data);
  },
  async reverseJournalEntry(id: string, payload: { reason?: string }) {
    return instance.post(`accounting/journal-entries/${id}/reverse/`, payload).then((response) => response.data);
  },
  async getTrialBalance(filters: { start_date?: string; end_date?: string }) {
    return instance.get("accounting/journal-entries/trial_balance/", { params: filters }).then((response) => response.data);
  },
};