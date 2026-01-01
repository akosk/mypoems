
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { calculatePrice } = useExpresta();
  
  if (!body.paperId || !body.copies || !body.pageCount) {
    throw createError({ statusCode: 400, message: 'Missing required parameters' });
  }

  try {
    const result = await calculatePrice({
      paperId: body.paperId,
      copies: body.copies,
      pageCount: body.pageCount
    });
    return result;
  } catch (e) {
    throw createError({ statusCode: 500, message: 'Calculation failed' });
  }
});
