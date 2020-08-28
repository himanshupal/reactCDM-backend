const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { data: { scope, subject, validFor, description } }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access, department } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`notices`);

		if (!subject && !description && !scope && !validFor)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `All fields are required.`,
			});

		if (![`Class`, `Course`, `Department`].includes(scope))
			throw new UserInputError(`Access Denied ⚠`, {
				error: `Notices can be provided only for class, course or for a department.`,
			});

		const check = await client
			.db(`RBMI`)
			.collection(scope === `Class` ? `classes` : scope === `Course` ? `courses` : `departments`)
			.findOne({ name: validFor });
		if (!check)
			throw new UserInputError(`${scope} Not Found ⚠`, {
				error: `Couldn't find any ${scope.toLowerCase()} with provided details.`,
			});

		const { insertedId } = await node.insertOne({
			scope,
			subject,
			validFor,
			description,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [saved] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{ $addFields: { createdBy: { $toObjectId: `$createdBy` } } },
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

		return saved;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
