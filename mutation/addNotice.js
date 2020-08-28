const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { data: { scope, subject, scopeId, description } }, { authorization }) => {
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

		if (!subject && !description)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `You must provide a subject with description to add notice.`,
			});

		if (![`Class`, `Course`, `Department`].includes(scope || `Department`))
			throw new UserInputError(`Access Denied ⚠`, {
				error: `Notices can be provided only for class, course or for a department.`,
			});

		if (scope && !scopeId)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `You must provide info of ${scope.toLowerCase()} to add notice for.`,
			});

		if (scope) {
			const check = await client
				.db(`RBMI`)
				.collection(scope === `Class` ? `classes` : scope === `Course` ? `courses` : `departments`)
				.findOne({ _id: ObjectId(scopeId) });
			if (!check)
				throw new UserInputError(`${scope} Not Found ⚠`, {
					error: `Couldn't find any ${
						scope === `Class` ? `class` : scope === `Course` ? `course` : `department`
					} with provided details.`,
				});
		}

		const { insertedId } = await node.insertOne({
			subject,
			description,
			scopeId: scopeId || department,
			scope: scope || `Department`,
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
				{ $unwind: `$createdBy` },
			])
			.toArray();

		return saved;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
