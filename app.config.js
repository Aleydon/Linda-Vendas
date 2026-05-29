/* eslint-disable no-undef */
export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY
      }
    }
  };
};
