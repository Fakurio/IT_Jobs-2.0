export interface ApplicationReviewedArgs {
  postTitle: string;
}

export interface NewApplicationArgs {
  applicantUsername: string;
  postTitle: string;
}

export interface PostRejectedArgs {
  postTitle: string;
}

export type NotificationArgs =
  | ApplicationReviewedArgs
  | NewApplicationArgs
  | PostRejectedArgs;
