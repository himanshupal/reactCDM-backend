const { MongoClient } = require(`mongodb`),
	authenticate = require(`../checkAuth`);

module.exports = async (_, { className }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	await authenticate(authorization);
	try {
		await client.connect();
		return await client
			.db(`RBMI`)
			.collection(`timetable`)
			.aggregate([
				{
					$match: {
						className,
					},
				},
				{
					$addFields: {
						"subjects.subjectId": {
							$toObjectId: `$subjects.subjectId`,
						},
					},
				},
				{
					$lookup: {
						from: `subjects`,
						localField: `subjects.subjectId`,
						foreignField: `_id`,
						as: `subjects`,
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
