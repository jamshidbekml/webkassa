import axios from 'axios';

export async function getCategoryName(catalogcode: string) {
  try {
    const {
      data: { recordTotal },
    } = await axios.get<{ recordTotal: number }>(
      `https://tasnif.soliq.uz/api/cls-api/class/short-info?groupCode=${catalogcode.slice(0, 3)}&size=1`,
    );

    const {
      data: { data },
    } = await axios.get<{ data: { code: string; name: string }[] }>(
      `https://tasnif.soliq.uz/api/cls-api/class/short-info?groupCode=${catalogcode.slice(0, 3)}&size=${recordTotal}`,
    );

    let categoryName: string;
    for await (const item of data) {
      if (item.code === catalogcode) {
        return (categoryName = item.name);
      }
    }
    return categoryName;
  } catch (err) {
    throw new Error(
      `Kategoriya yoki mahsulot IKPU to'g'ri kiritayotganingizga ishonch hosil qilings! Xatolik: ${err.message}`,
    );
  }
}
