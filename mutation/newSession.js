const { ForbiddenError, UserInputError } = require(`apollo-server`),
	{ MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { course, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const courseCheck = await client
			.db(`RBMI`)
			.collection(`courses`)
			.findOne({ _id: ObjectId(course) });
		if (!courseCheck) throw new UserInputError(`Course not found ⚠`, { error: `Couldn't find any course with given details.` });
		const res = await Promise.all(
			data.map(async (session) => {
				if (session.newName !== undefined)
					try {
						const node = client.db(`RBMI`).collection(`classes`);
						const classTeacherCheck = await node.findOne({
							classTeacher: session.classTeacher,
							name: { $ne: { $or: [session.name, session.newName] } },
						});
						if (classTeacherCheck) {
							const teacher = await client
								.db(`RBMI`)
								.collection(`teachers`)
								.findOne({ _id: ObjectId(classTeacherCheck.classTeacher) });
							throw new UserInputError(`Classteacher reallocation ⚠`, {
								error: `${teacher.name.first} ${teacher.name.last} is already assigned as classteacher for ${classTeacherCheck.name}.`,
							});
						}
						const single = await node.findOne({ name: session.name, course });
						return await node.updateOne(
							{ name: session.name, course },
							{
								$set: {
									course,
									name: session.newName,
									sessionStart: session.sessionStart,
									sessionEnd: session.sessionEnd,
									classTeacher: session.classTeacher,
									previousData: single
										? [
												...single.previousData,
												{
													class: single.name,
													classTeacher: single.classTeacher,
													sessionStart: single.sessionStart,
													sessionEnd: single.sessionEnd,
												},
										  ]
										: [],
									createdAt: Date.now(),
									createdBy: user.username,
								},
							},
							{
								upsert: true,
							}
						);
					} catch (error) {
						throw error;
					}
			})
		);
		return res.length > 0 ? `Classes saved successfully ✔` : `Error creating session. Please try again or contact admin if issue persists`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
