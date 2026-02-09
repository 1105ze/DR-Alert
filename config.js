<<<<<<< HEAD
export const API_BASE_URL = "http://10.103.80.176:8000";
=======
// export const API_BASE_URL = "http://192.168.68.112:8000";

import Constants from "expo-constants";

const host =
  Constants.expoConfig?.hostUri?.split(":").shift() ||
  Constants.manifest2?.extra?.expoClient?.hostUri?.split(":").shift();

export const API_BASE_URL = `http://${host}:8000`;
>>>>>>> 68f28fc0c08a7201d700079d57bbd9b1d18e011b
