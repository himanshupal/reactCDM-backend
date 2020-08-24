const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, { department, teacher }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`teachers`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (!department && !teacher)
			throw new UserInputError(`Insufficient data ⚠`, {
				error: `You must provide either a department or teacher's ID to get details of.`,
			});
		if (teacher)
			return await node
				.aggregate([
					{
						$match: {
							_id: ObjectId(teacher),
						},
					},
					{ $addFields: { _id: { $toString: `$_id` } } },
					{
						$lookup: {
							from: `classes`,
							localField: `_id`,
							foreignField: `classTeacher`,
							as: `classTeacherOf`,
						},
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `_id`,
							foreignField: `teacher`,
							as: `teaches`,
						},
					},
				])
				.toArray();
		if (department)
			return await node
				.aggregate([
					{
						$match: {
							department,
						},
					},
					{ $addFields: { _id: { $toString: `$_id` } } },
					{
						$lookup: {
							from: `classes`,
							localField: `_id`,
							foreignField: `classTeacher`,
							as: `classTeacherOf`,
						},
					},
					{
						$lookup: {
							from: `subjects`,
							localField: `_id`,
							foreignField: `teacher`,
							as: `teaches`,
						},
					},
				])
				.toArray();
		return await node
			.aggregate([
				{ $addFields: { _id: { $toString: `$_id` } } },
				{
					$lookup: {
						from: `classes`,
						localField: `_id`,
						foreignField: `classTeacher`,
						as: `classTeacherOf`,
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `teacher`,
						as: `teaches`,
					},
				},
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
