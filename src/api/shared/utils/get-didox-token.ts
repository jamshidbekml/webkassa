import axios from 'axios';

export async function getDidoxToken(inn: string, password: string) {
  try {
    const {
      data: { token },
    } = await axios.post<{ token: string }>(
      `https://api-partners.didox.uz/v1/auth/${inn}/password/uz`,
      {
        password,
      },
    );

    return token;
  } catch (err) {}
}
