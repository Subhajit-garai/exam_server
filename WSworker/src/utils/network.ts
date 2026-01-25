import axios from "axios";
import dotenv from "dotenv";
import { botPlatform } from "../lib/types/types.js";
import { logger } from "./logger.js";
import { user_data } from "src/socket/user.js";
dotenv.config();

export type CreationTypes =
  | "Updated"
  | "Created"
  | "Processing"
  | "Done"
  | "Suspended";

export class Network {
  private static instance: Network | null = null;
  private username: string;
  private password: string;
  private botauthtoken: string;
  islogin: boolean = false;
  private be_url: string = process.env.BE_URL || "";

  private constructor() {
    this.username = process.env.BE_USERNAME || "";
    this.password = process.env.BE_PASSWORD || "";
    this.botauthtoken = "";

    this.login();
  }

  public static getInstance(): Network {
    if (!Network.instance) {
      Network.instance = new Network();
    }
    return Network.instance;
  }

  getUrl(path: string, defaultPath: string = "/api/v1/bot"): string {
    return `${this.be_url}${defaultPath}${path}`;
  }
  getAccessToken(): string {
    return this.botauthtoken;
  }

  async postRequest(
    url: string,
    data: any,
    isOnlyData: boolean = false,
    isOnlyMessage: boolean = false
  ) {
    try {
      if (!this.botauthtoken) {
        await this.login();
      }

      let header = {
        Authorization: this.botauthtoken,
      };
      let responce = await axios.post(url, data, { headers: header });
      if (responce.data.success) {
        return isOnlyData
          ? responce.data?.data
          : isOnlyMessage
            ? responce.data?.message
            : responce.data;
      }
      return null;
    } catch (error: any) {
      logger.error(error?.response?.data?.message)
      return null;
    }
  }
  async getRequest(
    url: string,
    isOnlyData: boolean = false,
    isOnlyMessage: boolean = false
  ) {
    try {
      if (!this.botauthtoken) {
        await this.login();
      }
      let header = {
        Authorization: this.botauthtoken,
      };
      let responce = await axios.get(url, { headers: header });

      if (responce.data.success) {
        return isOnlyData
          ? responce.data?.data
          : isOnlyMessage
            ? responce.data?.message
            : responce.data;
      }
      return null;
    } catch (error: any) {
      logger.error(error?.response?.data?.message)
      return null;
    }
  }
  async auth() {
    try {
      let url = this.getUrl(`/auth`);
      let header = {
        Authorization: this.botauthtoken,
      };

      let request = await axios.get(url, { headers: header });
      console.log("response", request.status);
    } catch (error) { }
  }

  async SendNotificationToSurver(type = "", data: any = null) {
    let url = this.getUrl(`/notification?type=${type}`);
    let header = {
      Authorization: this.botauthtoken,
    };
    let request = await axios.post(url, data, { headers: header });
    if (request.status == 200) {
      console.log("response", request.status);
      console.log("notification sended ..");
    }
  }

  async login(retries = 10, delayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log("login porcess started .... ", `Attempt ${attempt}`);
        let url = this.getUrl(`/login`);
        let logindata = {
          email: this.username,
          password: this.password,
        };
        let request = await axios.post(url, logindata);

        console.log("login request", request.status);

        if (request) {
          console.log("Login successful");
          if (request?.data?.success) {
            console.log("Setting bot token....");
            this.botauthtoken = request?.data?.data;

            this.islogin = true;
            console.log("Bot token set successfully");
            return true;
          }
          return true;
        } else {
          console.log("Login failed");
          return false;
        }
      } catch (error: any) {
        console.error(`❌ Login attempt ${attempt} failed:`, error?.message);

        if (attempt === retries) {
          console.error("❌ All login attempts failed. Exiting.");
          process.exit(1); // exit app if still not successful
        }

        console.log(`🔁 Waiting ${delayMs}ms before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }


  async getuserInfo(userid: string): Promise<user_data> {
    let url = this.getUrl(`/user/info/${userid}`);
    return await this.getRequest(url, true)
  }


  async getExamQuestionsAns(examid: string) {
    try {
      let url = this.getUrl(`/question/ans/get/${examid}`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getExamQuestionsAns / Network ");
    }
  }
  async getQuestions(examid: string) {
    try {
      let url = this.getUrl(`/question/get/${examid}`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getQuestions / Network ");
    }
  }

  async getQuestions_byIds(ids: string[]) {
    try {
      let url = this.getUrl(`/question/get/byids`);
      return this.postRequest(url, ids, true);
    } catch (error) {
      throw new Error("Error from getQuestions / Network ");
    }
  }

  async getMockQuestionSet(mockid: string) {
    try {
      return this.getQuestions(mockid);
    } catch (error) {
      throw new Error("Error from getMockQuestionSet / Network ");
    }
  }

  async setMockQuestionSetStatus(mockid: string, status: CreationTypes) {
    try {
      let url = this.getUrl(`/mockquestionset/status/set/${mockid}`);

      return this.postRequest(url, status);
    } catch (error) {
      throw new Error("Error from getMockQuestionSet / Network ");
    }
  }
  async getQuestionsIds() {
    try {
      let url = this.getUrl(`/question/ids`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getQuestionsIds / Network ");
    }
  }
  async getExamDetails(examid: string) {
    try {
      let url = this.getUrl(`/exam/details/get/${examid}`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getExamDetails / Network ");
    }
  }
  async getExamPatternId(examid: string) {
    try {
      let url = this.getUrl(`/exam/patternid/get/${examid}`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getExamPatternId / Network ");
    }
  }
  async getExamPattern(exampatternid: string) {
    try {
      let url = this.getUrl(`/exampattern/get/${exampatternid}`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getExamPattern / Network ");
    }
  }
  async getUserAns(examid: string, userid: string) {
    try {
      let url = this.getUrl(`/user/ans/get?examid=${examid}&userid=${userid}`);
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getUserAns / Network ");
    }
  }
  async SetUserAns(userAns: any) {
    try {
      let url = this.getUrl(`/user/ans/set`);
      return this.postRequest(url, userAns, false, true);
    } catch (error) {
      throw new Error("Error from SetUserAns / Network ");
    }
  }

  async setUserScore(examid: string, userid: string, userScore: any) {
    try {
      let url = this.getUrl(
        `/user/score/set?examid=${examid}&userid=${userid}`
      );
      return this.postRequest(url, userScore, false, true);
    } catch (error) {
      throw new Error("Error from setUserScore / Network ");
    }
  }
  async getUserScore(examid: string, userid: string) {
    try {
      let url = this.getUrl(
        `/user/score/get?examid=${examid}&userid=${userid}`
      );
      return await this.getRequest(url, true, true);
    } catch (error) {
      throw new Error("Error from getUserScore / Network ");
    }
  }

  async setUserProgress(userid: string, userProgress: any) {
    try {
      let url = this.getUrl(`/user/progress/set?userid=${userid}`);
      return this.postRequest(url, userProgress, false, true);
    } catch (error) {
      throw new Error("Error from setUserProgress / Network ");
    }
  }

  async getQuizConfigData(
    chatid: number,
    platform: botPlatform,
    userid: number
  ) {
    try {
      let url = this.getUrl(
        `/get/quiz/config?chatid=${chatid}&userid=${userid}&platform=${platform}`
      );
      return this.getRequest(url, true);
    } catch (error) {
      throw new Error("Error from getSyllabusDataForExamCreattion / Network ");
    }
  }
}

export const network = Network.getInstance();
