const { ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

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
		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const check = await client
			.db(`RBMI`)
			.collection(`departments`)
			.findOne({ _id: ObjectId(queryDpt) });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the department you've provided details for.`,
			});

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
					{ $unwind: { path: `$headOfDepartment`, preserveNullAndEmptyArrays: true } },
					{
						$lookup: {
							from: `teachers`,
							localField: `createdBy`,
							foreignField: `_id`,
							as: `createdBy`,
						},
					},
					{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
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
				{ $unwind: { path: `$headOfDepartment`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
