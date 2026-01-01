
export default defineEventHandler(async (event) => {
  const { getPapers } = useExpresta();
  const papers = await getPapers();
  return { papers };
});
