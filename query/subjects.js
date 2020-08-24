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
		if (className)
			return await client
				.db(`RBMI`)
				.collection(`subjects`)
				.aggregate([
					{
						$match: {
							class: className,
						},
					},
					{
						$addFields: {
							teacher: {
								$toObjectId: `$teacher`,
							},
						},
					},
					{
						$lookup: {
							from: `teachers`,
							localField: `teacher`,
							foreignField: `_id`,
							as: `teacher`,
						},
					},
					{
						$unwind: `$teacher`,
					},
				])
				.toArray();
		return await client
			.db(`RBMI`)
			.collection(`subjects`)
			.aggregate([
				{
					$addFields: {
						teacher: {
							$toObjectId: `$teacher`,
						},
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `teacher`,
						foreignField: `_id`,
						as: `teacher`,
					},
				},
				{
					$unwind: `$teacher`,
				},
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
