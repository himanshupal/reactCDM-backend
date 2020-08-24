const { MongoClient } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { department: queryDpt }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access, department } = await authenticate(authorization);

		const node = client.db(`RBMI`).collection(`courses`);

		if (access === `Director`)
			return await node
				.aggregate([
					{ $match: { department: queryDpt || department } },
					{
						$addFields: {
							headOfDepartment: { $toObjectId: `$headOfDepartment` },
							createdBy: { $toObjectId: `$createdBy` },
						},
					},
					{
						$lookup: {
							from: `teachers`,
							localField: `headOfDepartment`,
							foreignField: `_id`,
							as: `headOfDepartment`,
						},
					},
					{ $unwind: `$headOfDepartment` },
					{
						$lookup: {
							from: `teachers`,
							localField: `createdBy`,
							foreignField: `_id`,
							as: `createdBy`,
						},
					},
					{ $unwind: `$createdBy` },
				])
				.toArray();

		return await node
			.aggregate([
				{ $match: { department } },
				{
					$addFields: {
						headOfDepartment: { $toObjectId: `$headOfDepartment` },
						createdBy: { $toObjectId: `$createdBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `headOfDepartment`,
						foreignField: `_id`,
						as: `headOfDepartment`,
					},
				},
				{ $unwind: `$headOfDepartment` },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: `$createdBy` },
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
