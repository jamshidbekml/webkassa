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
    console.log(token);

    return token;
  } catch (err) {
    console.log(err);
  }
}
