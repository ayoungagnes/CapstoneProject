export default async function ReadingPageDetail({ params }) {
  // Await params before destructuring
  const { id } = await params;

  const { connectToDatabase } = await import("@/app/lib/mongoose");
  const { QuestionMaterial } = await import("@/app/lib/models/QuestionMaterial");
  const { QuestionGroup } = await import("@/app/lib/models/QuestionGroup");
  const { Question } = await import("@/app/lib/models/Question");
  const ReadingMaterialQuestion = (await import("@/app/components/reading/readingMaterialQuestion")).default;

  await connectToDatabase();

  const material = await QuestionMaterial.findById(id).lean();
  const groups = await QuestionGroup.find({ questionMaterial: id }).sort("order").lean();
  const groupIds = groups.map((g) => g._id);
  const questions = await Question.find({ questionGroup: { $in: groupIds } }).lean();

  const grouped = groups.map((group) => ({
    ...group,
    questions: questions.filter(
      (q) => q.questionGroup.toString() === group._id.toString()
    ),
  }));

  // Serialize the data to remove MongoDB-specific properties
  const serializedMaterial = {
    _id: material._id.toString(),
    title: material.title,
    content: material.content,
    type: material.type,
    section: material.section,
    subtitle: material.subtitle,
    instruction: material.instruction,
    paragraphs: material.paragraphs?.map(paragraph => ({
      _id: paragraph._id.toString(),
      label: paragraph.label,
      content: paragraph.content,
    })) || [],
    createdAt: material.createdAt?.toISOString(),
    updatedAt: material.updatedAt?.toISOString(),
  };

  const serializedGroups = grouped.map((group) => ({
    _id: group._id.toString(),
    instruction: group.instruction,
    questionType: group.questionType,
    order: group.order,
    questionMaterial: group.questionMaterial.toString(),
    questions: group.questions.map((q) => ({
      _id: q._id.toString(),
      content: q.content,
      questionGroup: q.questionGroup.toString(),
      order: q.order,
      correctAnswer: q.correctAnswer,
      options: q.options,
      createdAt: q.createdAt?.toISOString(),
      updatedAt: q.updatedAt?.toISOString(),
    })),
  }));
  console.log("mat", serializedMaterial)
  return <ReadingMaterialQuestion material={serializedMaterial} groups={serializedGroups} />;
}