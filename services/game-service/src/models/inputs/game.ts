import { z } from 'zod';
//import { regex } from '../../utils/regex';

export const newGameInputSchema = z.object({
    userId: z.string()
    //.transform((val) => {
      // const match = val.match(regex.AUTHORIZATION_TOKEN);
      // console.log(val, match)
      // if (match) {
      //   return match[1];
      // } else {
      //   throw new Error("Invalid authorization format");
      // }
    //})
  });