use decimal::d128;

pub fn curr_weight(prev_weight: d128, prev_count: u32, curr_rate: u8) -> d128 {
    let prev_count = d128!(prev_count);
    let curr_rate = d128!(curr_rate);
    let next_count = prev_count + d128!(1);

    (prev_count / next_count) * prev_weight + (d128!(1) / (next_count * curr_rate));
}

fn sum_weights(weights: &Vec<d128>) -> d128 {
    let res = d128!(0);

    for w in weights {
        res += w;
    }

    res
}

fn curr_probabilities(curr_weights: &Vec<d128>) -> Vec<d128> {
    let mut res = Vec::new();
    let sum = sum_weights(curr_weights);

    for w in curr_weights {
        res.push(w / sum);
    }

    res
}

pub fn calc_breakpoints(curr_weights: &Vec<d128>) -> Vec<d128> {
    let mut res = Vec::new();
    let probabilities = curr_probabilities(curr_weights);
    let mut offset = d128!(0);

    for i in 0..probabilities.len() {
        offset += probabilities[i];
        res.push(offset);
    }

    res
}
