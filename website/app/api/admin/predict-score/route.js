import { requireRole } from '@/lib/auth/middleware';
import User from '@/lib/models/User';
import dbConnect from '@/lib/mongodb';
import { exec } from 'child_process';
import fs from 'fs';
import { NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(request) {
    const authCheck = requireRole(request, ['admin']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Dummy optimal loan application per user request
        const optimal_loan_application = {
            'loan_amnt': 500.0,
            'term': '36 months',
            'emp_length': '10+ years',
            'home_ownership': 'MORTGAGE',
            'annual_inc': 1500.0,
            'verification_status': 'Verified',
            'purpose': 'debt_consolidation',
            'dti': 5.0,
            'delinq_2yrs': 0.0,
            'earliest_cr_line': '1995-01-01',
            'inq_last_6mths': 0.0,
            'open_acc': 15.0,
            'pub_rec': 0.0,
            'revol_bal': 500.0,
            'revol_util': 10.0,
            'total_acc': 30.0,
            'tot_cur_bal': 1000.0,
            'total_rev_hi_lim': 500.0,
            'acc_open_past_24mths': 1.0,
            'num_accts_ever_120_pd': 0.0,
            'num_rev_accts': 10.0,
            'num_tl_op_past_12m': 1.0,
            'tot_hi_cred_lim': 2000.0,
            'total_bal_ex_mort': 100.0
        };

        // Write to temp file to securely pass without Windows CMD quote slicing issues
        const tmpFile = path.join(os.tmpdir(), `input_${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(optimal_loan_application));

        try {
            const pythonScriptPath = path.join(process.cwd(), 'predict.py');
            // Execute python model
            const { stdout, stderr } = await execPromise(`python ${pythonScriptPath} "${tmpFile}"`);

            // Clean up immediately
            fs.unlinkSync(tmpFile);

            // Scikit-learn might print warnings to stdout. Extract only the JSON part from the end.
            const cleanStdout = stdout.substring(stdout.indexOf('{'));
            const result = JSON.parse(cleanStdout);

            if (result.error) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }

            // Update user in DB with predicted score using updateOne to ensure simple operation
            await dbConnect();

            // Match email exactly but case insensitive
            const emailRegex = new RegExp(`^${email}$`, 'i');
            console.log("Updating user with email:", emailRegex);
            const user = await User.findOne({ email: emailRegex });
            console.log("Found user:", user);   
            
            const updateResult = await User.updateOne(
                { email: emailRegex },
                { $set: { 'creditScore': Math.floor(result.score) } },
                { runValidators: false }
            );

            console.log("Prediction Update Result for", email, ":", updateResult);

            return NextResponse.json({
                success: true,
                score: Math.floor(result.score),
                grade: result.grade,
                dbUpdated: updateResult.modifiedCount > 0
            });

        } catch (e) {
            console.error("Python execution or parsing error:", e);

            // Cleanup on error too
            if (fs.existsSync(tmpFile)) {
                fs.unlinkSync(tmpFile);
            }
            return NextResponse.json({ error: 'Failed to run machine learning prediction.' }, { status: 500 });
        }

    } catch (error) {
        console.error('Predict Score API Error:', error);
        return NextResponse.json({ error: 'Failed to predict profile score' }, { status: 500 });
    }
}
