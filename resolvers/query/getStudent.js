const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`),
	authenticate = require(`../../checkAuth`);

module.exports = async (_, { id }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_local, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = authenticate(authorization);
		if (user.access === `student` && id)
			throw new ForbiddenError(`Access Denied !`);
		const res = await client
			.db(`RBMI`)
			.collection(`students`)
			.aggregate([
				{
					$match: {
						$or: [
							{
								_id: ObjectId(id),
							},
							{
								username: user.username,
							},
						],
					},
				},
				{
					$lookup: {
						from: `attendence`,
						localField: `username`,
						foreignField: `students`,
						as: `attendence`,
					},
				},
				{
					$addFields: { class: { $toObjectId: `$class` } },
				},
				{
					$lookup: {
						from: `classes`,
						localField: `class`,
						foreignField: `_id`,
						as: `class`,
					},
				},
				{
					$unwind: `$class`,
				},
			])
			.toArray();
		return res[0];
	} catch {
		return error;
	} finally {
		await client.close();
	}
};
