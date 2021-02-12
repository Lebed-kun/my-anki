use crate::core::curr_weights;

fn init_eq_weights() -> Vec<f64> {
    vec![
        1_f64;
        10
    ]
} 

fn init_neq_weights() -> Vec<f64> {
    let mut res = Vec::new();
    
    for i in 1..=10 {
        res.push(i as f64);
    }

    res
}

fn init_eq_rates() -> Vec<u8> {
    vec![
        5;
        10
    ]
}

fn init_neq_rates() -> Vec<u8> {
    let mut res = Vec::new();
    
    for i in 1..=10 {
        res.push((i + 1) / 2);
    }

    res
}

#[test]
fn test_weights() {
    let weights = init_neq_weights();
    let rates = init_neq_rates();

    let real_weights = curr_weights(&weights, 5, &rates);
    
    println!("{:?}", real_weights);
    assert!(true);
}
