import slugify from "slugify";


export const ConvertInSlug = (title: string) => {
  return slugify(title, { lower: true });
};