import { IUser } from "../../Users/Users.interface";

export interface IParticipants {
  id: string;
  type: string;
  type_display?: string;
  user: string;
  user_details: IUser;
  status: string;
  
}
