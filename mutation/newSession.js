const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { course, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`classes`);

		const courseCheck = await client
			.db(dbName)
			.collection(`courses`)
			.findOne({ _id: ObjectId(course) });
		if (!courseCheck)
			throw new UserInputError(`Course not found ⚠`, {
				error: `Couldn't find any course with provided details.`,
			});

		const savedClasses = await Promise.all(
			data.map(async (current) => {
				try {
					if (current.newName !== undefined) {
						const already = await node.findOne({
							name: current.newName,
							course,
						});
						if (already)
							throw new UserInputError(`Class ${current.newName} already exists ⚠`, {
								error: `There is already a class with ${current.newName}. If you think this is an error, try updating the class manually or contact Admin.`,
							});

						if (current.classTeacher) {
							const assigned = await node.findOne({
								classTeacher: current.classTeacher,
								name: {
									$ne: {
										$or: [current.name, current.newName],
									},
								},
							});
							if (assigned) {
								const teacher = await client
									.db(dbName)
									.collection(`teachers`)
									.findOne({ _id: ObjectId(assigned.classTeacher) });
								throw new UserInputError(`Classteacher reallocation ⚠`, {
									error: `${teacher.name.first} ${teacher.name.last} is already assigned as classteacher for ${assigned.name}.`,
								});
							}
						}

						const previous = await node.findOne({ name: current.name, course });

						const name = current.newName;
						delete current.newName;

						const { lastErrorObject, value } = await node.findOneAndUpdate(
							{ name: current.name, course },
							{
								$set: {
									...current,
									course,
									name,
									previousData: previous
										? [
												...previous.previousData,
												{
													class: previous.name,
													classTeacher: previous.classTeacher,
													sessionStart: previous.sessionStart,
													sessionEnd: previous.sessionEnd,
												},
										  ]
										: [],
									createdAt: Timestamp.fromNumber(Date.now()),
									createdBy: loggedInUser,
								},
							},
							{ upsert: true, returnOriginal: false }
						);

						if (!lastErrorObject.n)
							throw new UserInputError(`Unknown Error ⚠`, {
								error: `Error creating/updating class. Please try again or contact admin if issue persists.`,
							});

						const [newClass] = await node
							.aggregate([
								{ $match: { _id: value._id } },
								{
									$addFields: {
										classTeacher: { $toObjectId: `$classTeacher` },
										createdBy: { $toObjectId: `$createdBy` },
										updatedBy: { $toObjectId: `$updatedBy` },
									},
								},
								{
									$lookup: {
										from: `teachers`,
										localField: `classTeacher`,
										foreignField: `_id`,
										as: `classTeacher`,
									},
								},
								{ $unwind: { path: `$classTeacher`, preserveNullAndEmptyArrays: true } },
								{
									$lookup: {
										from: `teachers`,
										localField: `createdBy`,
										foreignField: `_id`,
										as: `createdBy`,
									},
								},
								{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
								{
									$lookup: {
										from: `teachers`,
										localField: `updatedBy`,
										foreignField: `_id`,
										as: `updatedBy`,
									},
								},
								{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
							])
							.toArray();

						return newClass;
					}
				} catch (error) {
					throw error;
				}
			})
		);

		return savedClasses.filter((x) => x);
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
