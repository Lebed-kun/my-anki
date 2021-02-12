pub fn curr_weight(prev_weight: f64, prev_count: u32, curr_rate: u8) -> f64 {
    let prev_count = prev_count as f64;
    let curr_rate = curr_rate as f64;
    let next_count = (prev_count + 1.0) as f64;

    (prev_count / next_count) * prev_weight + (1.0 / (next_count * curr_rate))
}

fn sum_weights(weights: &Vec<f64>) -> f64 {
    let mut res = 0_f64;

    for w in weights {
        res += *w;
    }

    res
}

fn curr_probabilities(curr_weights: &Vec<f64>) -> Vec<f64> {
    let mut res = Vec::new();
    let sum = sum_weights(curr_weights);

    for w in curr_weights {
        res.push(w / sum);
    }

    res
}

pub fn calc_breakpoints(curr_weights: &Vec<f64>) -> Vec<f64> {
    let mut res = Vec::new();
    let probabilities = curr_probabilities(curr_weights);
    let mut offset = 0_f64;

    for i in 0..probabilities.len() {
        offset += probabilities[i];
        res.push(offset);
    }

    res
}
