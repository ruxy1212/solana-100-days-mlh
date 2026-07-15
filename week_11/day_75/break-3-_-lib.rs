use anchor_lang::prelude::*;

declare_program!(counter);

use counter::{
    accounts::Tally,
    cpi::{self, accounts::Increment},
    program::Counter,
};

declare_id!("EcFqW9ZeahZg4Hy5F4MM1KGuJKz2STirBRBNbjAKcm3j");

#[program]
pub mod compose_lab {
    use super::*;

    pub fn bump(ctx: Context<Bump>) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.key(), //invoke system_program instead of counter_program
            Increment {
                tally: ctx.accounts.tally.to_account_info(),
            },
        );
        cpi::increment(cpi_ctx)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Bump<'info> {
    #[account(mut)]
    pub tally: Account<'info, Tally>,
    pub counter_program: Program<'info, Counter>,
    pub system_program: Program<'info, System>, // add system_program to the context
}