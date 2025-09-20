import instance from "../../../api"


export const ParticipantsService = {
    async updateStatus(participantId: string, payload: any) {
        return instance.patch(`participants/${participantId}/`, payload).then((response) => response.data)
    },
}