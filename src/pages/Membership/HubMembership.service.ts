// HubMembership.service.ts
import instance from "../../api";
import { IMembership, HubMembershipApproval, HubMembershipRequest } from "./HubMembership.interface";

export class MembershipService {
  async getHubMemberships(filters: any): Promise<IMembership[]> {
    const response = await instance.get('/hubs/hubs/memberships/', {
      params: filters
    });
    return response.data;
  }

  async approveMembership(membershipId: string, data: HubMembershipApproval): Promise<IMembership> {
    const response = await instance.post(`/hubs/hubs/memberships/${membershipId}/approve/`, data);
    return response.data;
  }

  async rejectMembership(membershipId: string, notes?: string): Promise<IMembership> {
    const response = await instance.post(`/hubs/hubs/memberships/${membershipId}/reject/`, {
      status: 'rejected' as const,
      notes
    });
    return response.data;
  }

  async deleteMembership(membershipId: string): Promise<void> {
    await instance.delete(`/hubs/hubs/memberships/${membershipId}/`);
  }

  async requestMembership(data: HubMembershipRequest): Promise<IMembership> {
    const response = await instance.post('/hubs/hubs/memberships/request_membership/', data);
    return response.data;
  }

  async leaveMembership(membershipId: string): Promise<void> {
    const response = await instance.post(`/hubs/hubs/memberships/${membershipId}/leave/`);
    return response.data;
  }

  // Helper method for checking single hub membership
  async checkHubMembership(hubId: string): Promise<IMembership | null> {
    try {
      const memberships = await this.getHubMemberships({ hub_id: hubId });
      // Find the current user's membership in this hub
      return memberships.find(m => {
        if (typeof m.hub === 'string') {
          return m.hub === hubId;
        } else if (typeof m.hub === 'object' && m.hub !== null && 'id' in m.hub) {
          return m.hub.id === hubId;
        }
        return false;
      }) || null;
    } catch (error) {
      console.error("Error checking hub membership:", error);
      return null;
    }
  }
}

// Export a singleton instance
export const membershipService = new MembershipService();