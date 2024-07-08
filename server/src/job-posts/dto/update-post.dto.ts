import { z } from "zod";
import AddPostSchema from "./add-post.dto";

const UpdatePostSchema = AddPostSchema.partial();

export default UpdatePostSchema;
export type UpdatePostDTO = z.infer<typeof UpdatePostSchema>;
