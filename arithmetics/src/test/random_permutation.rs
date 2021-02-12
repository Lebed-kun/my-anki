use crate::core::{random_permutation, curr_weights};

fn init_neq_weights() -> Vec<f64> {
    let mut res = Vec::new();
    
    for i in 1..=10 {
        res.push(1.5_f64.powf(i as f64));
    }

    res
}

fn init_neq_rates() -> Vec<u8> {
    let mut res = Vec::new();
    
    for i in 1..=10 {
        res.push((i * 10) / 2);
    }

    res
}

#[test]
fn test_permutation() {
    let weights = init_neq_weights();
    let rates = init_neq_rates();
    
    let next_weights = curr_weights(&weights, 100, &rates);
    let permutation = random_permutation(15, &next_weights);

    println!("Weights: {:?}", next_weights);
    println!("Permutation: {:?}", permutation);
}