mod utils;

use utils::{curr_weight, calc_breakpoints};
use rand::{random, thread_rng, Rng};

pub fn curr_weights<'a>(prev_weights: &'a Vec<f64>, prev_count: u32, curr_rates: &'a Vec<u8>) -> Vec<f64> {
    assert_eq!(prev_weights.len(), curr_rates.len());
    
    let mut res = Vec::new();

    for i in 0..prev_weights.len() {
        res.push(curr_weight(prev_weights[i], prev_count, curr_rates[i]))
    }

    res
}

pub fn random_permutation(count: usize, curr_weights: &Vec<f64>) -> Vec<usize> {
    let mut res = Vec::new();
    let breakpoints = calc_breakpoints(curr_weights);

    let mut rng = thread_rng();

    for _ in 0..count {
        let rand_num = random::<f64>();
        let prev_count = res.len();

        for j in 0..breakpoints.len() {
            if rand_num < breakpoints[j] {
                res.push(j);
                break;
            }
        } 

        if res.len() == prev_count {
            let id = rng.gen_range(0..breakpoints.len());
            res.push(id);
        }
    }

    res
}
