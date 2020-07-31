const { ForbiddenError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`, `Assistant Professor`];

module.exports = async (_, __, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const dptNode = client.db(`RBMI`).collection(`departments`);
		const teacherNode = client.db(`RBMI`).collection(`teachers`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		if (user.access === `Director`) {
			const departments = await dptNode
				.aggregate([
					{
						$addFields: {
							_id: { $toString: `$_id` },
						},
					},
					{
						$lookup: {
							from: `courses`,
							localField: `_id`,
							foreignField: `department`,
							as: `courses`,
						},
					},
				])
				.toArray();
			const teachers = await teacherNode.find().toArray();
			return { departments, teachers };
		}
		return await dptNode
			.aggregate([
				{ $match: { _id: ObjectId(user.department) } },
				{
					$addFields: {
						_id: { $toString: `$_id` },
					},
				},
				{
					$lookup: {
						from: `courses`,
						localField: `_id`,
						foreignField: `department`,
						as: `courses`,
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
